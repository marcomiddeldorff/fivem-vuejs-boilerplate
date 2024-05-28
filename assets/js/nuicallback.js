export class NuiCallback {
    static async invoke(name, body = {}) {
        return await fetch(`https://${GetParentResourceName()}/${name}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(body)
        });
    }
}