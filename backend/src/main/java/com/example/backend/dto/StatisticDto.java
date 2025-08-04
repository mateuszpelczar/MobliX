package com.example.backend.dto;

import lombok.*;

@Getter
@Setter
@Builder
public class StatisticDto {
    private String label;
    private Long value;
}
