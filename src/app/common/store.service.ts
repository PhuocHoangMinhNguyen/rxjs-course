import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { fromPromise } from "rxjs/internal-compatibility";
import { tap, map, filter } from "rxjs/operators";
import { Course } from "../model/course";
import { createHttpObservable } from "./util";

@Injectable({
    providedIn: 'root'
})
export class Store {

    private subject = new BehaviorSubject<any[]>([]);

    courses$: Observable<Course[]> = this.subject.asObservable();

    init() {
        const http$ = createHttpObservable('api/courses');

        http$.pipe(
            tap(() => console.log('HTTP request executed')),
            map(res => Object.values(res['payload'])),
        ).subscribe(
            courses => this.subject.next(courses)
        );
    }

    selectBeginnerCourses() {
        return this.filterByCategory('BEGINNER');
    }

    selectAdvancedCourses() {
        return this.filterByCategory('BEGINNER');
    }

    selectCourseById(courseId: number) {
        return this.courses$.pipe(
            map(courses => courses.find(course => course.id == courseId))
        );
    }

    filterByCategory(category: string) {
        return this.courses$.pipe(
            map(courses => courses.filter(course => course.category == 'BEGINNER')),
            filter(course => !!course)
        );
    }

    saveCourse(courseId: number, changes): Observable<any> {
        const courses = this.subject.getValue();

        const courseIndex = courses.findIndex(course => course.id == courseId);

        const newCourses = courses.slice(0);

        newCourses[courseIndex] = {
            ...courses[courseIndex],
            ...changes
        }

        this.subject.next(newCourses);

        return fromPromise(fetch(`/api/courses/${courseId}`, {
            method: 'PUT',
            body: JSON.stringify(changes),
            headers: {
                'content-type': 'application/json'
            }
        }));
    }

}