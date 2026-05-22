package com.backend.sensor;

import java.time.LocalTime;
import java.time.LocalDate;

public class SunriseSunsetCalculator {

    public static boolean isDaytime(double latitude, double longitude) {
        LocalTime sunrise = getSunrise(latitude, longitude);
        LocalTime sunset  = getSunset(latitude, longitude);
        LocalTime now     = LocalTime.now();
        return now.isAfter(sunrise) && now.isBefore(sunset);
    }

    public static LocalTime getSunrise(double latitude, double longitude) {
        int month = LocalDate.now().getMonthValue();
        double baseSunriseHour = 6.0;
        if (month >= 6 && month <= 8) baseSunriseHour = 5.0 + (latitude - 35) * 0.05;
        else if (month == 12 || month <= 2) baseSunriseHour = 7.5 - (latitude - 35) * 0.05;
        int hour   = (int) baseSunriseHour;
        int minute = (int) ((baseSunriseHour - hour) * 60);
        return LocalTime.of(hour, minute);
    }

    public static LocalTime getSunset(double latitude, double longitude) {
        int month = LocalDate.now().getMonthValue();
        double baseSunsetHour = 18.5;
        if (month >= 6 && month <= 8) baseSunsetHour = 19.5 + (latitude - 35) * 0.03;
        else if (month == 12 || month <= 2) baseSunsetHour = 17.5 - (latitude - 35) * 0.03;
        int hour   = (int) baseSunsetHour;
        int minute = (int) ((baseSunsetHour - hour) * 60);
        return LocalTime.of(hour, minute);
    }
}
