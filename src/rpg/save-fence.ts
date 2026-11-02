/** Cross-renderer CAS metadata only. Educational/world JSON stays in localStorage. */
export type CommitResult='saved'|'conflict'|'failed';
interface Head {hash:string;pending?:{from:string;to:string}}
export interface SaveFence {
  rebase(key:string,expected:string|null,read:()=>string|null):Promise<boolean>;
  commit(key:string,expected:string|null,next:string,read:()=>string|null,write:()=>boolean):Promise<CommitResult>;
}
export function createSaveFence():SaveFence {
  let connection:Promise<IDBDatabase>|null=null;
  function open():Promise<IDBDatabase> {
    if(connection)return connection;
    connection=new Promise<IDBDatabase>((resolve,reject)=>{
      const request=indexedDB.open('pashto-quest-save-fence-v1',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('heads');
      request.onerror=()=>{connection=null;reject(request.error);};
      request.onsuccess=()=>{
        const db=request.result;db.onversionchange=()=>{db.close();connection=null;};resolve(db);
      };
    }).catch(error=>{connection=null;throw error;});
    return connection;
  }
  async function hash(raw:string|null):Promise<string> {
    const bytes=new TextEncoder().encode(raw===null?'null\0':'value\0'+raw);
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  }
  function transaction<T>(db:IDBDatabase,key:string,apply:(head:Head|undefined,store:IDBObjectStore)=>T):Promise<T> {
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('heads','readwrite'),store=tx.objectStore('heads');
      let result:T;
      const request=store.get(key);
      request.onsuccess=()=>{try{result=apply(request.result as Head|undefined,store);}catch(error){tx.abort();reject(error);}};
      tx.oncomplete=()=>resolve(result);
      tx.onabort=()=>reject(tx.error??new Error('Revision transaction aborted'));
      tx.onerror=()=>{}; // onabort owns the rejected result.
    });
  }
  return {async rebase(key,expected,read):Promise<boolean> {
    try {
      if(read()!==expected)return false;
      const db=await open(),token=await hash(expected);
      return await transaction(db,key,(_head,store)=>{if(read()!==expected)return false;store.put({hash:token} satisfies Head,key);return true;});
    }catch{return false;}
  },async commit(key,expected,next,read,write):Promise<CommitResult> {
    try{
      const db=await open();
      const [before,after,current]=await Promise.all([hash(expected),hash(next),hash(read())]);
      if(current!==before)return 'conflict';
      const mode=await transaction(db,key,(head,store):'write'|'noop'|'conflict'=>{
        let token=head?.hash??current;
        // A pending record is an interrupted/unacknowledged write. Recover only
        // an exact before/after image; never transform or repair saved content.
        if(head?.pending){
          if(current!==head.pending.from&&current!==head.pending.to)return 'conflict';
          token=current;
        }
        if(token!==before)return 'conflict';
        if(before===after){store.put({hash:before} satisfies Head,key);return 'noop';}
        store.put({hash:before,pending:{from:before,to:after}} satisfies Head,key);return 'write';
      });
      if(mode==='conflict')return 'conflict';
      const saved=write();
      if(mode==='noop')return saved?'saved':'failed';
      // A failed write can have an ambiguous outcome (for example readback
      // fails after setItem). Keep both hashes until an exact image is read.
      if(!saved)return 'failed';
      // Only an acknowledged local write advances the committed hash. If this
      // transaction fails, pending metadata permits exact recovery on retry.
      await transaction(db,key,(head,store)=>{
        if(head?.pending?.from!==before||head.pending.to!==after)throw Error('Revision changed during commit');
        store.put({hash:after} satisfies Head,key);
      });
      return saved?'saved':'failed';
    }catch{return 'failed';}
  }};
}
