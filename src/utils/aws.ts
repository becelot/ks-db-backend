import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda";

export type LambdaFunction<Input = APIGatewayEvent> = (event: Input, context: any) => Promise<APIGatewayProxyResult>;
