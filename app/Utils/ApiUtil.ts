export function Response(message, data: any) {
    return {
        success: true,
        message: message,
        data: data
    }
}
