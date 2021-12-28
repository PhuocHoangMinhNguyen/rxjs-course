import { Component, OnInit } from '@angular/core';
import { Course } from "../model/course";
import { interval, noop, Observable, of, throwError, timer } from 'rxjs';
import { catchError, delay, delayWhen, finalize, map, retryWhen, shareReplay, tap } from 'rxjs/operators';
import { createHttpObservable } from '../common/util';
import { Store } from '../common/store.service';


@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    beginnerCourses$: Observable<Course[]>;

    advancedCourses$: Observable<Course[]>;

    ngOnInit() {

        const http$ = createHttpObservable('api/courses');

        const courses$ = http$.pipe(
            tap(() => console.log('HTTP request executed')),
            map(res => Object.values(res['payload'])),
            shareReplay(),
            retryWhen(errors => errors.pipe(
                delayWhen(() => timer(2000))
            ))
        ) as Observable<Course[]>;

        this.beginnerCourses$ = courses$.pipe(
            map(courses => {
                return courses.filter(course => course.category == 'BEGINNER');
            })
        );

        this.advancedCourses$ = courses$.pipe(
            map(courses => {
                return courses.filter(course => course.category == 'ADVANCED');
            })
        );

    }

}
