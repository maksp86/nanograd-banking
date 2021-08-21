import { useCallback, useState } from "react";

function RequestError(message, errors, errcod) {
    this.name = 'RequestError';
    this.errors = errors;
    this.errcod = errcod;
    this.message = message;
    this.stack = (new Error()).stack;
  }
  RequestError.prototype = Object.create(Error.prototype);
  RequestError.prototype.constructor = RequestError;

export const useHttp = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const request = useCallback(
        async (url, method = 'GET', body = 'null', headers = {}) => {
            setLoading(true)
            try {

                if (body) {
                    body = JSON.stringify(body)
                    headers['Content-Type'] = 'application/json'
                }

                const response = await fetch(url, { method, body, headers })
                const data = await response.json();

                if (!response.ok)
                {
                    throw new RequestError(data.message || "Incorrect response from server", data.errors, data.errcod)
                }

                setLoading(false)
                return data
            } catch (error) {
                setLoading(false)
                setError(error)
            }
        }, [])

    const clearError = useCallback(() => setError(null), [])

    return { loading, request, error, clearError, setLoading }
}