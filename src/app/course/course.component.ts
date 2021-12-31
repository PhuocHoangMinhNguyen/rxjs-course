import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Course } from "../model/course";
import {
    debounceTime,
    distinctUntilChanged,
    startWith,
    tap,
    delay,
    map,
    concatMap,
    switchMap,
    withLatestFrom,
    concatAll, shareReplay, first, take
} from 'rxjs/operators';
import { merge, fromEvent, Observable, concat, forkJoin, pipe } from 'rxjs';
import { Lesson } from '../model/lesson';
import { createHttpObservable } from '../common/util';
import { Store } from '../common/store.service';
import { debug, RxJsLoggingLevel, setRxJsLoggingLevel } from '../common/debug';

@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {

    courseId: number;
    course$: Observable<Course>;
    lessons$: Observable<Lesson[]>;

    @ViewChild('searchInput') input: ElementRef;

    constructor(
        private route: ActivatedRoute,
        private store: Store
    ) { }

    ngOnInit() {

        this.courseId = this.route.snapshot.params['id'];

        this.course$ = this.store.selectCourseById(this.courseId);

        this.loadLessons().pipe(
            withLatestFrom(this.course$)
        ).subscribe(([lessons, courses]) => {
            console.log("lessons" + lessons);
            console.log("course: " + courses);
        });
    }

    ngAfterViewInit() {

        this.lessons$ = fromEvent<any>(this.input.nativeElement, 'keyup').pipe(
            map(event => event.target.value),
            startWith(''),
            debug(RxJsLoggingLevel.TRACE, 'search'),
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(search => this.loadLessons(search)),
            debug(RxJsLoggingLevel.DEBUG, 'lessons value'),
        );

    }

    loadLessons(search = ''): Observable<Lesson[]> {
        return createHttpObservable(`api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search}`).pipe(
            map(res => res['payload'])
        );
    }

}











