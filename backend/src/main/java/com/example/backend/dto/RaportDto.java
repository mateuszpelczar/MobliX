package com.example.backend.dto;

import lombok.*;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class RaportDto {
    private Long id;
    private String description;
    private String createdAt;
}
