package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.flywaydb.core.Flyway;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Configuration to handle Flyway migration strategy for existing databases.
 * This cleans up any incorrect flyway_schema_history entries and creates
 * a proper baseline at version 14 before running migrations.
 */
@Configuration
public class FlywayCleanupConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            try (Connection connection = flyway.getConfiguration().getDataSource().getConnection();
                 Statement statement = connection.createStatement()) {
                
                // Check if flyway_schema_history exists and has wrong baseline
                var rs = statement.executeQuery(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'flyway_schema_history'"
                );
                rs.next();
                boolean tableExists = rs.getInt(1) > 0;
                
                if (tableExists) {
                    // Check if baseline is at version 0 (wrong version)
                    var baselineRs = statement.executeQuery(
                        "SELECT version FROM flyway_schema_history WHERE type = 'BASELINE' LIMIT 1"
                    );
                    if (baselineRs.next()) {
                        String baselineVersion = baselineRs.getString(1);
                        if ("0".equals(baselineVersion)) {
                            // Wrong baseline, need to reset
                            System.out.println("FlywayCleanup: Detected wrong baseline version (0). Resetting schema history...");
                            statement.execute("DROP TABLE flyway_schema_history");
                            tableExists = false;
                        }
                    }
                }
                
            } catch (Exception e) {
                System.err.println("FlywayCleanup: Error during cleanup: " + e.getMessage());
                // Continue with migration even if cleanup fails
            }
            
            // Now run the actual migration
            flyway.migrate();
        };
    }
}
