import {DataMapper} from "@aws/dynamodb-data-mapper";
import {Mapper} from "../utils/mapper";
import {Document} from "../models/document";
import {DocType} from "../models/document.type";
import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda";
import {LambdaFunction} from "../utils/aws";

export const create: LambdaFunction = async (event: APIGatewayEvent, context: any): Promise<APIGatewayProxyResult> => {
    const mapper: DataMapper = Mapper.Instance;
    const document: Document = new Document();
    document.name = 'TestFolder';
    document.children = [];
    document.type = DocType.DOC_FOLDER;

    const answer = await mapper.put(document);

    return {
        statusCode: 200,
        body: JSON.stringify(answer)
    }
};
