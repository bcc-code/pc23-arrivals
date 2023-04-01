

export type Scan = {
    id: string;
    date_created: string;
    person: {
        name: string;
    };
}

export class Api {
    apiKey: string
    constructor(apiKey: string) {
        this.apiKey=apiKey
    }

    async fetchScansBetween(start: Date, end: Date): Promise<{ data?: Scan[], meta?: {filter_count?: number, total_count?: number} }> {
        const recentScansRes = await fetch(`https://ticket-scanner.activityweb.no/items/scans?fields=id%2Cdate_created%2Cperson.name%2Cevent&sort=-date_created&filter=%7B%22date_created%22%3A%7B%22_gte%22%3A%22${start.toISOString()}%22%7D%7D`, {
            "headers": {
              "authorization": "Bearer "+ this.apiKey,
            },
          });
        const recentScans = await recentScansRes.json();
        console.log(recentScans.data)
        if (recentScans.data) {
            recentScans.data = recentScans.data.filter((el:any) => new Date(el.date_created) < end); // because _lte gave 500 error
        }
        return recentScans;
    }

    async fetchCountOfScansSince(start: Date, end?: Date): Promise<number | undefined> {
        const recentScansRes = await fetch(`https://ticket-scanner.activityweb.no/items/scans?limit=0&meta=filter_count&sort=-date_created&filter=%7B%22_and%22%3A%5B%7B%22date_created%22%3A%7B%22_gte%22%3A%22${start.toISOString()}%22%7D%7D%5D%7D`, {
            "headers": {
              "authorization": "Bearer "+this.apiKey,
            },
          });
        const recentScans = await recentScansRes.json();
        return (recentScans.meta as any).filter_count;
    }
}