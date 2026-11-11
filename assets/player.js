/* PLAYVERSE local profiles. Progress is saved in this browser; cross-device cloud sync requires a hosted backend. */
(()=>{'use strict';
const USERS='pvUsersV1',ACTIVE='pvActiveUserV1',GUEST='playverseCoins';
const items=[
{id:'mint-paddle',name:'Mint Circuit Paddle',kind:'paddle',price:120,description:'A bright mint-green paddle skin.'},
{id:'sunset-paddle',name:'Sunset Paddle',kind:'paddle',price:180,description:'A warm orange and pink paddle skin.'},
{id:'prism-ball',name:'Prism Ball',kind:'ball',price:150,description:'A colorful ball trail for Pixel Foundry.'},
{id:'star-trail',name:'Starlight Trail',kind:'trail',price:220,description:'A glowing trail for your Starfall ship.'},
{id:'foundry-2',name:'Foundry Level Pack 2',kind:'unlock',price:250,description:'Unlock the next challenge pack early.'}
];
const read=()=>{try{return JSON.parse(localStorage.getItem(USERS)||'{}')}catch{return {}}};
const write=x=>localStorage.setItem(USERS,JSON.stringify(x));
const active=()=>localStorage.getItem(ACTIVE)||'';
const users=read();
const safeName=n=>/^[A-Za-z0-9_]{3,16}$/.test(n);
const bytesToHex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function hash(pass,salt){const enc=new TextEncoder(),key=await crypto.subtle.importKey('raw',enc.encode(pass),'PBKDF2',false,['deriveBits']);return bytesToHex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:180000,hash:'SHA-256'},key,256))}
function current(){const all=read(),id=active();return id&&all[id]?all[id]:null}
function balance(){const p=current();if(p)return p.coins||0;return Math.max(0,Number(localStorage.getItem(GUEST)||0))}
function persist(p){const all=read();all[p.username.toLowerCase()]=p;write(all)}
function notify(){window.dispatchEvent(new CustomEvent('playverse:change',{detail:{user:profile(),coins:balance()}}))}
function profile(){const p=current();return p?{username:p.username,coins:p.coins,progress:p.progress||{},inventory:p.inventory||[],equipped:p.equipped||{}}:null}
async function signup(username,password){username=username.trim();if(!safeName(username))throw Error('Username must be 3–16 letters, numbers, or underscores.');if(password.length<8)throw Error('Use a password with at least 8 characters.');const id=username.toLowerCase(),all=read();if(all[id])throw Error('That username is already taken on this browser.');const salt=bytesToHex(crypto.getRandomValues(new Uint8Array(16)));const p={username,salt,hash:await hash(password,salt),coins:Math.max(0,Number(localStorage.getItem(GUEST)||0)),progress:{},inventory:[],equipped:{}};all[id]=p;write(all);localStorage.setItem(ACTIVE,id);localStorage.removeItem(GUEST);notify();return profile()}
async function login(username,password){const id=username.trim().toLowerCase(),p=read()[id];if(!p)throw Error('No local profile found with that username.');if(await hash(password,p.salt)!==p.hash)throw Error('Incorrect password.');localStorage.setItem(ACTIVE,id);notify();return profile()}
function logout(){const p=current();if(p){localStorage.setItem(GUEST,String(p.coins||0))}localStorage.removeItem(ACTIVE);notify()}
function addCoins(n,reason='game reward'){n=Math.max(0,Math.floor(Number(n)||0));const p=current();if(p){p.coins=(p.coins||0)+n;persist(p)}else localStorage.setItem(GUEST,String(balance()+n));notify();return balance()}
function spendCoins(n){n=Math.max(0,Math.floor(Number(n)||0));if(balance()<n)return false;const p=current();if(p){p.coins-=n;persist(p)}else localStorage.setItem(GUEST,String(balance()-n));notify();return true}
function saveProgress(game,data){const p=current();if(!p)return false;p.progress=p.progress||{};p.progress[game]=Object.assign({},p.progress[game]||{},data,{updatedAt:Date.now()});persist(p);notify();return true}
function getProgress(game){const p=current();return p?.progress?.[game]||{}}
function buy(id){const item=items.find(x=>x.id===id);if(!item)throw Error('That item is not available.');const p=current();if(!p)throw Error('Create or sign in to a local profile before buying.');p.inventory=p.inventory||[];if(p.inventory.includes(id))throw Error('You already own this item.');if((p.coins||0)<item.price)throw Error('You need '+(item.price-p.coins)+' more coins.');p.coins-=item.price;p.inventory.push(id);if(item.kind==='paddle')p.equipped.paddle=id;if(item.kind==='ball')p.equipped.ball=id;if(item.kind==='trail')p.equipped.trail=id;if(item.id==='foundry-2'){p.progress=p.progress||{};p.progress['pixel-foundry']=Object.assign({},p.progress['pixel-foundry']||{},{unlockedLevel:Math.max(5,Number(p.progress['pixel-foundry']?.unlockedLevel||1))})}persist(p);notify();return item}
function owns(id){return !!current()?.inventory?.includes(id)}
window.Playverse={profile,balance,signup,login,logout,addCoins,spendCoins,saveProgress,getProgress,buy,owns,items,notify};
})();