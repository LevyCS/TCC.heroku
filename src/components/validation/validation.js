export function ValidateEmptyNullCamps(item) {
    let r = Object.values(item)
    r.map(item => {
        if(!item || item.replace(/\n/g, '') == '')
            return true
    })
    return false;
}