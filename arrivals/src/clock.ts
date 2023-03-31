export class Clock {
    private _startTime: Date | null;
    private _customTime: Date | null;
    private _timeSpeed: number;

    constructor(customDate?: Date) {
        this._startTime = customDate ? new Date() : null;
        this._customTime = customDate || null;
        this._timeSpeed = 1;
    }

    now(): Date {
        if (this._customTime === null || this._startTime === null) {
            return new Date();
        }

        const currentTime = new Date();
        const timeDifference = currentTime.getTime() - this._startTime.getTime();
        return new Date(this._customTime.getTime() + timeDifference * this._timeSpeed);
    }

    setTime(date: Date): void {
        this._customTime = date;
        this._startTime = new Date();
    }

    setSpeed(factor: number): void {
        if (factor <= 0) {
            throw new Error('Speed-up factor must be greater than 0.');
        }
        this._timeSpeed = factor;
    }
}
