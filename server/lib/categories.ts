import axios from "axios";

export enum Category {
    Groceries,
    DiningOut,
    CarExpenses,
    Gas,
    RentAndUtilities,
    PublicTransportation,
    Ridesharing,
    Fitness,
    Fun,
    Travel,
    Misc,
}

export class CategoryFinder {
    raw_description: string;

    constructor(desc: string) {
        this.raw_description = desc;
    }

    async getCategory(): Promise<string> {
        this._googleSearchQuery("cnn");
        return new Promise((resolve, reject) => {
            resolve("Got it!");
        });
    }

    async _googleSearchQuery(query: string) {
        try {
            const response = await axios.get("https://www.google.com/search", {
                params: {
                    q: query,
                },
            });

            console.log("Search Results:", response.data);
            // You can parse the response data here to extract relevant information from the HTML.
        } catch (error) {
            console.error(
                "Error while performing Google search:",
                error.message,
            );
        }
    }
}
