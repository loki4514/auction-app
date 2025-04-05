export interface login_response<T, K>{
    success : boolean,
    status : number,
    message : string,
    token : T,
    data : K
}