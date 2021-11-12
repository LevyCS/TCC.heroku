export function ValidateEmptyNullCamps(item) {
    let r = Object.values(item)
    r.map(item => {
        if(!item)
            return false;
        
    })
    return true;
}