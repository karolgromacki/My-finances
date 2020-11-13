export class Account {
    constructor(
        public id: string,
        public title: string,
        public note: string,
        public amount: number,
        public baseAmount: number,
        public userId: string,
    ) { }
}