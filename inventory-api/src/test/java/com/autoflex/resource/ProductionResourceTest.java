package com.autoflex.resource;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.autoflex.dto.ProductionSuggestionResponseDTO;
import com.autoflex.dto.SuggestedProductDTO;
import com.autoflex.service.ProductionService;

import java.math.BigDecimal;
import java.util.Collections;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
public class ProductionResourceTest {

    @InjectMock
    ProductionService productionService;

    @Test
    public void testSuggestEndpoint() {
        SuggestedProductDTO item = new SuggestedProductDTO(
                1L,
                "COD01",
                "Produto Super",
                10,
                new BigDecimal("1500.00"));
        ProductionSuggestionResponseDTO mockResponse = new ProductionSuggestionResponseDTO(
                Collections.singletonList(item),
                new BigDecimal("1500.00"));

        Mockito.when(productionService.suggestProduction()).thenReturn(mockResponse);

        given()
                .when().get("/api/production/suggest")
                .then()
                .statusCode(200)
                .body("totalExpectedValue", is(1500.0f))
                .body("suggestions.size()", is(1))
                .body("suggestions[0].productName", is("Produto Super"))
                .body("suggestions[0].suggestedQuantity", is(10));
    }
}