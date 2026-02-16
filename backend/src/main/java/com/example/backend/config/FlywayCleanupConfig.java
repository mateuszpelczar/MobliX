package com.example.backend.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.sql.Connection;
import java.sql.Statement;


@Configuration
public class FlywayCleanupConfig {


    //konfiguracja strategii migracji Flyway dla istniejących baz danych
    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            try (Connection connection = flyway.getConfiguration().getDataSource().getConnection();
                 Statement statement = connection.createStatement()) {
                
               //sprawdza czy tabela flyway_schema_history istnieje i ma nieprawidłową wersję bazową
                var rs = statement.executeQuery(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'flyway_schema_history'"
                );
                rs.next();
                boolean tableExists = rs.getInt(1) > 0;
                
                if (tableExists) {
                   //sprawdza czy wersja bazowa jest nieprawidłowa
                    var baselineRs = statement.executeQuery(
                        "SELECT version FROM flyway_schema_history WHERE type = 'BASELINE' LIMIT 1"
                    );
                    if (baselineRs.next()) {
                        String baselineVersion = baselineRs.getString(1);
                        if ("0".equals(baselineVersion)) {
                           //nieprawidłowa wersja bazowa, resetuje historię migracji
                            System.out.println("FlywayCleanup: Detected wrong baseline version (0). Resetting schema history...");
                            statement.execute("DROP TABLE flyway_schema_history");
                            tableExists = false;
                        }
                    }
                }
                
            } catch (Exception e) {
                System.err.println("FlywayCleanup: Error during cleanup: " + e.getMessage());
                //kontynuuje migrację nawet jeśli czyszczenie się nie powiodło
            }
            
            //wykonuje migrację
            flyway.migrate();
        };
    }
}
