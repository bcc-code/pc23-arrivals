
import { InlineResponse2004, ItemsScansApiFactory, XMetadata } from './ticket-scanner-sdk/index';


export type Scan = {
    id: string;
    date_created: string;
    person: {
        name: string;
    };
}

export class Api {
    itemScansApi: { readItemsScans(fields?: string[] | undefined, limit?: number | undefined, meta?: string | undefined, offset?: number | undefined, sort?: string[] | undefined, filter?: string[] | undefined, search?: string | undefined, options?: any): Promise<InlineResponse2004>; };
    constructor(apiKey: string) {
        this.itemScansApi = ItemsScansApiFactory({
            apiKey: 'Bearer ' + apiKey,
        })
    }

    async fetchScansBetween(start: Date, end: Date): Promise<{ data?: Scan[], meta?: XMetadata }> {
        const recentScans = await this.itemScansApi.readItemsScans(
            ["id", "date_created", "person.name", "event"],
            undefined,
            undefined,
            undefined,
            ["date_created"], // sort
            [
                JSON.stringify({
                    date_created: { _gte: start.toISOString() },
                    //event: { _eq: eventId },
                }),
            ] // filter
        );
        console.log(recentScans.data)
        if (recentScans.data) {
            recentScans.data = recentScans.data.filter((el) => new Date(el.date_created) < end); // because _lte gave 500 error
        }
        return recentScans;
    }

    async fetchCountOfScansSince(start: Date, end?: Date): Promise<number | undefined> {
        const recentScans = await this.itemScansApi.readItemsScans(
            undefined,
            0,
            "filter_count",
            undefined,
            ["-date_created"],
            [
                JSON.stringify({
                    _and: [
                        { date_created: { _gte: start.toISOString() } },
                    ]
                }),
            ],

        );
        return (recentScans.meta as any).filter_count;
    }
}