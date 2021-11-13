export function validateEmptyValues(item) {
    let resp = true;

    let r = Object.values(item);
    r.map(i => {
        if (i.replace(/\n/g, '') == '' || i == "" || i == null || i == undefined) {  
            resp = false;
        }
    })

    return resp;
}