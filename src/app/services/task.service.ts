import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, retry, shareReplay, tap, throwError } from 'rxjs';

export interface Task {
    id: number;
    title: string;
    description: string;
    startDate: string; 
    dueDate: string;
    status: string;
    subtasks?: Subtask[];
    teamAssignment?: TeamAssignment;
}

export interface Subtask {
    title: string;
}

export interface TeamAssignment {
    teamMemberName: string;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private apiUrl = 'http://localhost:5095';
    private tasksCache$: Map<string, Observable<{ tasks: Task[], totalCount: number }>> = new Map();
    private taskCacheMap: Map<number, Observable<Task>> = new Map();

    constructor(private http: HttpClient) { }

    getTasks(page: number = 1, pageSize: number = 10): Observable<{ tasks: Task[], totalCount: number }> {
        const cacheKey = `${page}-${pageSize}`;

        // Check if this page is already cached
        if (!this.tasksCache$.has(cacheKey)) {
            const params = new HttpParams()
                .set('page', page.toString())
                .set('pageSize', pageSize.toString());

            // If not cached, make the HTTP request and cache the result
            const tasks$ = this.http.get<{ tasks: Task[], totalCount: number }>(`${this.apiUrl}/tasks`, { params }).pipe(
                retry(3), // Retry the request up to 3 times in case of an error
                catchError((error) => {
                    console.error('Error fetching tasks:', error);
                    return throwError(() => new Error('Failed to load tasks. Please try again later.'));
                }),
                shareReplay(1) // Share and cache the result
            );

            this.tasksCache$.set(cacheKey, tasks$);
        }

        // Return the cached Observable
        return this.tasksCache$.get(cacheKey)!;
    }

    addTask(task: Omit<Task, 'id'>): Observable<Task> {
        return this.http.post<Task>(`${this.apiUrl}/tasks`, task).pipe(
            tap(() => {
                this.tasksCache$.clear();
            })
        );
    }

    getTaskById(id: number): Observable<Task> {
        if (!this.taskCacheMap.has(id)) {
            const task$ = this.http.get<Task>(`${this.apiUrl}/tasks/${id}`).pipe(
                shareReplay(1)
            );
            this.taskCacheMap.set(id, task$);
        }
        return this.taskCacheMap.get(id)!;
    }

    updateTask(id: number, updatedTask: Task): Observable<Task> {
        return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, updatedTask).pipe(
            tap(() => {
                this.tasksCache$.clear(); // Invalidate tasks list cache
                this.taskCacheMap.delete(id); // Invalidate individual task cache
            })
        );
    }

    deleteTask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`).pipe(
            tap(() => {
                this.tasksCache$.clear(); // Invalidate tasks list cache
                this.taskCacheMap.delete(id); // Invalidate individual task cache
            })
        );
    }

    getUserAssignments(): Observable<{ taskId: number; teamAssignment: TeamAssignment }[]> {
        return this.http.get<{ taskId: number; teamAssignment: TeamAssignment }[]>(
            `${this.apiUrl}/user-assignments`
        );
    }
}
