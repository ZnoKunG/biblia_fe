async function GetISBNBook(endpoint: string) {
    try {
        console.log(`get isbn request: ${process.env.EXPO_PUBLIC_ISBN_API_ENDPOINT}/${endpoint}`);
        console.log(`authorizing with key ${process.env.EXPO_PUBLIC_ISBN_API_KEY}`);

        const resp = await fetch(`${process.env.EXPO_PUBLIC_ISBN_API_ENDPOINT}/${endpoint}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${process.env.EXPO_PUBLIC_ISBN_API_KEY}`,
            }
        });

        return resp;
    } catch (error) {
        console.error("Error fetching ISBN:", error);
        return null;
    }
}

async function GetISBNBooks(isbns: string[]) {
    try {
        const isbn_books = isbns.join(",");
        console.log("Posting ISBNs:", isbn_books);
        const resp = await fetch("https://api2.isbndb.com/books", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `${process.env.EXPO_PUBLIC_ISBN_API_KEY}`,
            },
            body: `isbns=${isbn_books}`,
        });

        return resp;
    } catch (error) {
        console.error("Error posting ISBNs:", error);
        return null;
    }
}

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

async function Patch(endpoint: string, id: string, bodyObj: string) {
    try {
        console.log(`Try patch request: ${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}/${id} with body: ${bodyObj}`);
        return await fetch(`${process.env.EXPO_PUBLIC_API_ENDPOINT}/${endpoint}/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: bodyObj,
        });
    } catch (error) {
        console.error("Error in PATCH request:", error);
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

export { GetISBNBook, GetISBNBooks, Get, GetWithQueryParams, Post, Patch, Delete, DeleteWithBody };