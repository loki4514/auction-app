export interface getDetails <T> {
    success : boolean,
    status : number,
    data : T,
    message? : string
}