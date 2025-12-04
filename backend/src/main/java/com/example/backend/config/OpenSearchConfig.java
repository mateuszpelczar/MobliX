package com.example.backend.config;

import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.ssl.SSLContextBuilder;
import org.opensearch.client.RestHighLevelClient;
import org.opensearch.client.RestClient;
import org.opensearch.client.RestClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.net.ssl.SSLContext;

@Configuration
public class OpenSearchConfig {

    @Value("${opensearch.host}")
    private String opensearchHost;

    @Value("${opensearch.port}")
    private int opensearchPort;

    @Value("${opensearch.username}")
    private String opensearchUsername;

    @Value("${opensearch.password}")
    private String opensearchPassword;

    @Bean
    @ConditionalOnProperty(name = "opensearch.enabled", havingValue = "true", matchIfMissing = false)
    public RestHighLevelClient opensearchClient() {
        try {
            // Konfiguracja Basic Authentication
            final CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
            credentialsProvider.setCredentials(
                    AuthScope.ANY,
                    new UsernamePasswordCredentials(opensearchUsername, opensearchPassword)
            );

            // AWS OpenSearch - połączenie przez HTTPS z autentykacją
            SSLContext sslContext = SSLContextBuilder.create()
                    .loadTrustMaterial(null, (chain, authType) -> true)
                    .build();

            RestClientBuilder builder = RestClient.builder(
                    new HttpHost(opensearchHost, opensearchPort, "https")
            ).setHttpClientConfigCallback(httpClientBuilder -> {
                httpClientBuilder.setSSLContext(sslContext);
                httpClientBuilder.setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE);
                httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider);
                return httpClientBuilder;
            });

            return new RestHighLevelClient(builder);
        } catch (Exception e) {
            throw new RuntimeException("Nie można połączyć z OpenSearch: " + e.getMessage(), e);
        }
    }
}
