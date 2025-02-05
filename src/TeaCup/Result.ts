import {just, Maybe, nothing} from "./Maybe";

/**
 * A computation may result in a value (Ok), or an error (Err)
 */
export type Result<E,R> = Ok<E,R> | Err<E,R>


export class Ok<E,R> {

    readonly tag: "Ok" = "Ok";
    readonly value:R;

    constructor(value: R) {
        this.value = value;
    }

    map<R2>(f: (r: R) => R2): Result<E, R2> {
        return new Ok(f(this.value));
    }

    mapError<E2>(f: (e: E) => E2): Result<E2, R> {
        return new Ok<E2,R>(this.value);
    }

    toMaybe(): Maybe<R> {
        return just(this.value);
    }


    match<X>(onOk: (r: R) => X, onErr: (e: E) => X): X {
        return onOk(this.value);
    }
}


export class Err<E,R> {

    readonly tag: "Err" = "Err";
    readonly err:E;

    constructor(err: E) {
        this.err = err;
    }

    map<R2>(f: (r: R) => R2): Result<E, R2> {
        return new Err<E,R2>(this.err);
    }

    mapError<E2>(f: (e: E) => E2): Result<E2, R> {
        return new Err<E2,R>(f(this.err))
    }

    toMaybe(): Maybe<R> {
        return nothing;
    }

    match<X>(onOk: (r: R) => X, onErr: (e: E) => X): X {
        return onErr(this.err);
    }

}

/**
 * Create an Ok Result
 * @param r the value to wrap
 */
export function ok<E,R>(r:R): Result<E,R> {
    return new Ok<E,R>(r);
}


/**
 * Create an Err result
 * @param e the error to wrap
 */
export function err<E,R>(e:E): Result<E,R> {
    return new Err(e);
}