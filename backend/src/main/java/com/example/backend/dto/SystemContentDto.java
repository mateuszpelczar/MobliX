package com.example.backend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SystemContentDto {
    private Long id;
    private String title;
    private String body;
}
