package com.autoflex;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasSize;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import com.autoflex.dto.ProductDTO;
import com.autoflex.dto.ProductRawMaterialDTO;
import com.autoflex.dto.RawMaterialDTO;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ResourceFlowTest {

    static Long productId;
    static Long woodId;
    static Long glueId;

    @Test
    @Order(1)
    void testCreateRawMaterials() {
        // Create Wood
        RawMaterialDTO wood = new RawMaterialDTO("WOOD-01", "Wood Plank", 100);
        woodId = ((Number) given()
                .contentType(ContentType.JSON)
                .body(wood)
                .when().post("/api/raw-materials")
                .then()
                .statusCode(201)
                .body("code", is("WOOD-01"))
                .extract().path("id")).longValue();

        // Create Glue
        RawMaterialDTO glue = new RawMaterialDTO("GLUE-01", "Super Glue", 50);
        glueId = ((Number) given()
                .contentType(ContentType.JSON)
                .body(glue)
                .when().post("/api/raw-materials")
                .then()
                .statusCode(201)
                .body("code", is("GLUE-01"))
                .extract().path("id")).longValue();
    }

    @Test
    @Order(2)
    void testCreateProduct() {
        ProductDTO table = new ProductDTO("TABLE-01", "Wooden Table", new BigDecimal("150.00"), null);
        productId = ((Number) given()
                .contentType(ContentType.JSON)
                .body(table)
                .when().post("/api/products")
                .then()
                .statusCode(200)
                .body("code", is("TABLE-01"))
                .extract().path("id")).longValue();
    }

    @Test
    @Order(3)
    void testAssociateMaterialsWithProduct() {
        // Associate Wood (4 units)
        ProductRawMaterialDTO woodAssoc = new ProductRawMaterialDTO("WOOD-01", 4);
        given()
                .contentType(ContentType.JSON)
                .body(woodAssoc)
                .when().post("/api/products/" + productId + "/materials")
                .then()
                .statusCode(200)
                .body("rawMaterial.code", is("WOOD-01"))
                .body("quantityNeeded", is(4));

        // Associate Glue (1 unit)
        ProductRawMaterialDTO glueAssoc = new ProductRawMaterialDTO("GLUE-01", 1);
        given()
                .contentType(ContentType.JSON)
                .body(glueAssoc)
                .when().post("/api/products/" + productId + "/materials")
                .then()
                .statusCode(200)
                .body("rawMaterial.code", is("GLUE-01"))
                .body("quantityNeeded", is(1));
    }

    @Test
    @Order(4)
    void testGetProductWithMaterials() {
        given()
                .when().get("/api/products/" + productId)
                .then()
                .statusCode(200)
                .body("code", is("TABLE-01"))
                .body("materials", hasSize(2))
                .body("materials.rawMaterial.code", hasItems("WOOD-01", "GLUE-01"));
    }

    @Test
    @Order(5)
    void testUpdateMaterialQuantity() {
        // Change Glue to 2 units
        ProductRawMaterialDTO glueUpdate = new ProductRawMaterialDTO("GLUE-01", 2);
        given()
                .contentType(ContentType.JSON)
                .body(glueUpdate)
                .when().put("/api/products/" + productId + "/materials/GLUE-01")
                .then()
                .statusCode(200)
                .body("rawMaterial.code", is("GLUE-01"))
                .body("quantityNeeded", is(2));
    }

    @Test
    @Order(6)
    void testSyncMaterials() {
        // Bulk update: only Wood (10 units)
        List<ProductRawMaterialDTO> syncList = List.of(
                new ProductRawMaterialDTO("WOOD-01", 10));

        given()
                .contentType(ContentType.JSON)
                .body(syncList)
                .when().put("/api/products/" + productId + "/materials")
                .then()
                .statusCode(200)
                .body("$", hasSize(1))
                .body("[0].rawMaterial.code", is("WOOD-01"))
                .body("[0].quantityNeeded", is(10));
    }

    @Test
    @Order(7)
    void testDeleteProductAndCleanup() {
        // Delete product
        given()
                .when().delete("/api/products/" + productId)
                .then()
                .statusCode(200);

        // Verify product is gone
        given()
                .when().get("/api/products/" + productId)
                .then()
                .statusCode(404);

        // Cleanup Raw Materials
        given().when().delete("/api/raw-materials/" + woodId).then().statusCode(204);
        given().when().delete("/api/raw-materials/" + glueId).then().statusCode(204);
    }
}
