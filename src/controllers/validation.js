export function validateEmptyValues(item) {
    let r = Object.values(item)
    r.map(i => {
        if (!i|| i.replace(/\n/g, '') != '')    
        return true;
    })

    return false;
}