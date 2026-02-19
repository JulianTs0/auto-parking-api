export class RegexValidators {
    public static readonly NAME =
        /^[\p{L}]{2,20}(?:[ '-][\p{L}]{2,20})*$/u;
    public static readonly PASSWORD =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,}$/;
    public static readonly PHONE = /^[+]?[0-9\s\-\(\)]{7,20}$/;
}
