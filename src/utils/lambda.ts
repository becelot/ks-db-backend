import {APIGatewayEvent, APIGatewayEventRequestContext, APIGatewayProxyResult} from "aws-lambda";
import {LambdaFunction} from "./aws";

export type RestApiEvent<Input> = Omit<APIGatewayEvent, 'body'> & { body: Input };
export type RestApiOutput<Output> = Omit<APIGatewayProxyResult, 'body'> & { body: Output };

export abstract class AwsLambda<Input, Output> {
    private context: APIGatewayEventRequestContext;
    public async abstract perform(input: RestApiEvent<Input>): Promise<RestApiOutput<Output>>;

    public get CurrentUserName(): string {
        return this.context.authorizer
            && this.context.authorizer.claims
            && this.context.authorizer.claims['cognito:username'];
    }

    protected responseBuilder(statusCode: number, response: Output) {
        return {
            statusCode,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: response
        };
    }

    public async handler(event: APIGatewayEvent, context: APIGatewayEventRequestContext): Promise<APIGatewayProxyResult> {
        let obj: RestApiEvent<Input> =
            Object.assign(
                Object.assign({}, event),
                {body: !!event.body ? JSON.parse(event.body) : {}}
                );

        this.context = event.requestContext;
        const response: RestApiOutput<Output> = await this.perform(obj);
        return {
            ...response,
            body: JSON.stringify(response.body)
        };
    }
}

export function toLambda<Input, Output>(lambda: AwsLambda<Input, Output>): LambdaFunction {
    return async (event: APIGatewayEvent, context: APIGatewayEventRequestContext): Promise<APIGatewayProxyResult> =>
        await lambda.handler(event, context);
}
