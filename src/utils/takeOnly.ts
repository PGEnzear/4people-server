export const takeOnly = (keys: string[], data: object | Object) => {
    return Object.fromEntries(Object.entries(data).filter(([key]) => (
        (keys as (keyof typeof data)[])
            .includes((key as unknown as (keyof typeof data)))
    )))
}