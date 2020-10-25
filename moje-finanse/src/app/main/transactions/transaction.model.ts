export class Transaction {
    constructor(
        public id: string,
        public type: string,
        public title: string,
        public note: string,
        public category: string,
        public account: string,
        public amount: number,
        public date: Date,
        public imageUrl: string,
    ) { }
}