export function Response(data: any) {
    return {
        status: 200,
        count: Array.isArray(data) ? data.length : 1,
        data: data
    }
}