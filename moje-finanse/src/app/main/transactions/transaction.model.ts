export class Transaction {
    constructor(
        public id: string,
        public type: string,
        public title: string,
        public category: string,
        public amount: number,
        public imageUrl: string
    ) { }
}