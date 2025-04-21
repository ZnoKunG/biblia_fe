async function Get(endpoint: string) {
    try {
        console.log(`get request: ${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}`);
        return await fetch(`${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}`);
    } catch (error) {
        console.error("Error in GET request:", error);
        return null;
    }
}

async function GetWithQueryParams(endpoint: string, queryParams: Record<string, string>) {
    try {
        const queryString = Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`).join('&');
        console.log(`Try get request with query params: ${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}?${queryString}`);
        return await fetch(`${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}?${queryString}`);
    } catch (error) {
        console.error("Error in GET with query params:", error);
        return null;
    }
}

async function Post(endpoint: string, bodyObj: string) {
    try {
        console.log(`Try post request: ${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint} with body: ${bodyObj}`);
        return await fetch(`${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: bodyObj,
        });
    } catch (error) {
        console.error("Error in POST request:", error);
        return null;
    }
}

async function Put(endpoint: string, queryParams: Record<string, string>, bodyObj: string) {
    try {
        const queryString = Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`).join('&');
        console.log(`Try put request with query params: ${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}?${queryString}`);
        return await fetch(`${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}?${queryString}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: bodyObj,
        });
    } catch (error) {
        console.error("Error in PUT request:", error);
        return null;
    }
}

async function Delete(endpoint: string) {
    try {
        console.log(`Try delete request: ${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}`);
        return await fetch(`${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}`, {
            method: "DELETE"
        });
    } catch (error) {
        console.error("Error in DELETE request:", error);
        return null;
    }
}

async function DeleteWithQueryParams(endpoint: string, queryParams: Record<string, string>) {
    try {
        const queryString = Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`).join('&');
        console.log(`Try delete request with query params: ${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}?${queryString}`);
        return await fetch(`${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}?${queryString}`, { method: "DELETE" });
    } catch (error) {
        console.error("Error in DELETE request:", error);
        return null;
    }
}

async function DeleteWithBody(endpoint: string, bodyObj: string) {
    try {
        console.log(`Try delete request with body: ${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}`);
        return await fetch(`${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: bodyObj,
        });
    } catch (error) {
        console.error("Error in DELETE with body request:", error);
        return null;
    }
}

export { Get, GetWithQueryParams, Post, Put, Delete, DeleteWithQueryParams, DeleteWithBody };