export function accountAddress(name){
 const normalized=name.trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'.');
 if(!/^[a-z0-9][a-z0-9._-]{2,49}$/.test(normalized))throw new Error('Use a name of 3–50 letters or numbers. Spaces, dots, and hyphens are welcome.');
 return normalized+'@accounts.vista.invalid';
}
