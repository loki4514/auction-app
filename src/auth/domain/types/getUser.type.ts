export interface getUsersReponse<T>{
    success : boolean,
    status : number,
    message : string
    data?: T
    
}