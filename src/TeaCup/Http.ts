import {Task} from "./Task";
import {err, ok, Result} from "./Result";
import {Decoder} from "./Decode";

/**
 * Turns JS's fetch into Tasks.
 */
export class Http {

    /**
     * Create a task over the native fetch() function.
     * @param request the request
     * @param init the request init
     */
    static fetch(request:RequestInfo, init?: RequestInit): Task<Error,Response> {
        return new FetchTask(request, init);
    }

    /**
     * Helper for JSON responses : uses passed decoder to convert a
     * JSON response
     * @param t the fetch task
     * @param d the decoder
     */
    static jsonBody<R>(t: Task<Error,Response>, d:Decoder<R>): Task<Error,R> {
        return Http.ifOk(t, r => Task.fromPromise(() => r.json()).andThen((json:any) => {
            const decoded: Result<string,R> = d.decodeValue(json);
            switch (decoded.tag) {
                case "Ok":
                    return Task.succeed(decoded.value);
                case "Err":
                    return Task.fail(new Error(decoded.err))
            }
        }))
    }

    /**
     * Helper for string responses.
     * @param t the fetch task
     */
    static stringBody(t: Task<Error,Response>): Task<Error,string> {
        return Http.ifOk(t, response => Task.fromPromise(() => response.text()))
    }

    /**
     * Helper for turning a response that is not ok into an error
     * @param t the response
     * @param f a function that maps the Response to a type
     */
    static ifOk<R>(t:Task<Error,Response>, f:(r:Response) => Task<Error,R>): Task<Error,R> {
        return t.andThen(r => {
            if (r.ok) {
                return f(r);
            } else {
                return Task.fail(new Error(`invalid response ${r.status}:${r.statusText}`))
            }
        });
    }



}


class FetchTask extends Task<Error,Response> {

    private readonly request: RequestInfo;
    private readonly init?: RequestInit;

    constructor(request: RequestInfo, init?: RequestInit) {
        super();
        this.request = request;
        this.init = init;
    }

    execute(callback: (r: Result<Error, Response>) => void): void {
        try {
            fetch(this.request, this.init)
                .then((response:Response) => callback(ok(response)))
                .catch((e:Error) => callback(err(e)));
        } catch (e) {
            callback(err(e));
        }
    }
}