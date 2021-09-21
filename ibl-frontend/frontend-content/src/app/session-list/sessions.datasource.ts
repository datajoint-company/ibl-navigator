


// import {CollectionViewer, DataSource} from "@angular/cdk/collections";
// import {Observable, BehaviorSubject, of} from "rxjs";
// import {SessionInterface} from "./sessionInterface";
// import {AllSessionsService} from "./all-sessions.service";
// import {catchError, finalize} from "rxjs/operators";



// export class SessionsDataSource implements DataSource<SessionInterface> {

//     private SessionInterfacesSubject = new BehaviorSubject<SessionInterface[]>([]);

//     private loadingSubject = new BehaviorSubject<boolean>(false);

//     public loading$ = this.loadingSubject.asObservable();

//     constructor(private AllSessionsService: AllSessionsService) {

//     }

//     loadSessionInterfaces(session_uuid: string,
//                 filter:string,
//                 sortDirection:string,
//                 pageIndex:number,
//                 pageSize:number) {

//         this.loadingSubject.next(true);

//         this.AllSessionsService.fetchSessions(session_uuid).pipe(
//                 catchError(() => of([])),
//                 finalize(() => this.loadingSubject.next(false))
//             )
//             .subscribe(SessionInterfaces => this.SessionInterfacesSubject.next(SessionInterfaces));

//     }

//     connect(collectionViewer: CollectionViewer): Observable<SessionInterface[]> {
//         console.log("Connecting data source");
//         return this.SessionInterfacesSubject.asObservable();
//     }

//     disconnect(collectionViewer: CollectionViewer): void {
//         this.SessionInterfacesSubject.complete();
//         this.loadingSubject.complete();
//     }

// }