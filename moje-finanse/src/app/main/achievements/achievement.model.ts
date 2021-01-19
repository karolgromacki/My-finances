export class Achievement {
    constructor(
        public id: string,
        public title: string,
        public date: Date,
        public points: number,
        public obtained: boolean
    ) { }
}
//porównanie sum wydanych w kategorii z dwóch różnych miesięcy
//utworzenie pierwszej transakcji
//utworzenie 10,20,50,100,200 transakcji, gdzie kategoria różna od transfer
//utworzenie budżetu
//
//przekroczenie budżetu sprawdzenie transakcji z każdego dnia czy przekraczają budżet
