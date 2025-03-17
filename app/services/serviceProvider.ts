async function Get(endpoint: string)
{
    console.log(`get request: ${process.env.API_ENDPOINT}/${endpoint}`)
    const resp = await fetch(`${process.env.API_ENDPOINT}/${endpoint}`);
    return resp;
}

async function GetWithQueryParams(endpoint: string, queryParams: Record<string, string>)
{
    const queryString = Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`).join('&');
    console.log(`Try get request with query params: ${process.env.API_ENDPOINT}/${endpoint}?${queryString}`);
    const resp = await fetch(`${process.env.API_ENDPOINT}/${endpoint}?${queryString}`);
    return resp;
}

async function Post(endpoint: string, bodyObj: string)
{
    console.log(`Try post request: ${process.env.API_ENDPOINT}/${endpoint} with body: ${bodyObj}`);
    const resp = await fetch(`${process.env.API_ENDPOINT}/${endpoint}`,
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: bodyObj,
    });
    return resp;
}

async function Patch(endpoint: string, id: string, bodyObj: string)
{
    console.log(`Try post request: ${process.env.API_ENDPOINT}/${endpoint}/${id} with body: ${bodyObj}`);
    const resp = await fetch(`${process.env.API_ENDPOINT}/${endpoint}/${id}`,
    {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: bodyObj,
    });
    return resp;
}

async function Delete(endpoint: string)
{
    console.log(`Try delete request: ${process.env.API_ENDPOINT}/${endpoint}`);
    const resp = await fetch(`${process.env.API_ENDPOINT}/${endpoint}`,
    {
        method: "DELETE"
    });
    return resp;
}

async function DeleteWithBody(endpoint: string, bodyObj: string)
{
    console.log(`Try delete request: ${process.env.API_ENDPOINT}/${endpoint}`);
    const resp = await fetch(`${process.env.API_ENDPOINT}/${endpoint}`,
    {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: bodyObj,
    });
    return resp;
}

export { Get, GetWithQueryParams, Post, Patch, Delete };