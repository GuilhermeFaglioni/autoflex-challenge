package com.autoflex.resource;

import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.mock.PanacheMock;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.autoflex.dto.ProductDTO;
import com.autoflex.dto.ProductRawMaterialDTO;
import com.autoflex.model.Product;
import com.autoflex.model.ProductRawMaterial;
import com.autoflex.model.RawMaterial;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
public class ProductResourceTest {

    @Test
    public void testGetAllProducts() {
        PanacheMock.mock(Product.class);
        Product p = new Product();
        p.code = "P001";
        p.name = "Produto Teste";

        Mockito.when(Product.listAll()).thenReturn(Collections.singletonList(p));

        given().when().get("/api/products")
                .then().statusCode(200).body("size()", is(1));
    }

    @Test
    public void testGetProductById() {
        PanacheMock.mock(Product.class);
        Product p = new Product();
        p.name = "Pneu";
        Mockito.when(Product.findById(1L)).thenReturn(p);

        given().pathParam("id", 1L)
                .when().get("/api/products/{id}")
                .then().statusCode(200).body("name", is("Pneu"));
    }

    @Test
    public void testGetProductByCode() {
        PanacheMock.mock(Product.class);
        Product p = new Product();
        p.name = "Motor";

        PanacheQuery queryMock = Mockito.mock(PanacheQuery.class);
        Mockito.when(queryMock.firstResult()).thenReturn(p);
        Mockito.when(Product.find("code", "MOT01")).thenReturn(queryMock);

        given().pathParam("code", "MOT01")
                .when().get("/api/products/code/{code}")
                .then().statusCode(200).body("name", is("Motor"));
    }

    @Test
    public void testGetProductByName() {
        PanacheMock.mock(Product.class);
        Product p = new Product();
        p.code = "MOT01";

        PanacheQuery queryMock = Mockito.mock(PanacheQuery.class);
        Mockito.when(queryMock.firstResult()).thenReturn(p);
        Mockito.when(Product.find("name", "Motor")).thenReturn(queryMock);

        given().pathParam("name", "Motor")
                .when().get("/api/products/name/{name}")
                .then().statusCode(200).body("code", is("MOT01"));
    }

    @Test
    public void testSearchProducts() {
        QuarkusTransaction.requiringNew().run(() -> {
            Product p = new Product();
            p.code = "SRC123";
            p.name = "Parafuso Especial";
            p.price = new BigDecimal("10.0");
            p.persist();
        });

        given().queryParam("q", "parafuso")
                .when().get("/api/products/search")
                .then().statusCode(200)
                .body("[0].name", is("Parafuso Especial"));
    }

    @Test
    public void testCreateProduct_Success() {

        ProductDTO newProductDTO = new ProductDTO("C001", "Volante", new BigDecimal("150.00"), Collections.emptyList());

        given().contentType(ContentType.JSON).body(newProductDTO)
                .when().post("/api/products")
                .then().statusCode(200).body("name", is("Volante"));
    }

    @Test
    public void testUpdateProduct() {

        Product p = new Product();
        p.code = "UPD123";
        p.name = "Velho";
        p.price = new BigDecimal("10.0");
        QuarkusTransaction.requiringNew().run(() -> p.persist());

        ProductDTO dto = new ProductDTO("UPD123", "Novo", new BigDecimal("200.00"), Collections.emptyList());

        given().contentType(ContentType.JSON).body(dto)
                .when().put("/api/products/{id}", p.id)
                .then().statusCode(200)
                .body("name", is("Novo"));
    }

    @Test
    public void testDeleteProduct() {
        PanacheMock.mock(Product.class);
        Product mockProduct = Mockito.mock(Product.class);
        Mockito.when(Product.findById(1L)).thenReturn(mockProduct);

        given().pathParam("id", 1L)
                .when().delete("/api/products/{id}")
                .then().statusCode(200);
    }

    @Test
    public void testAddRawMaterial() {
        Product p = new Product();
        p.code = "MAT_PROD";
        p.name = "Produto Material";
        p.price = new BigDecimal("50.0");

        RawMaterial rm = new RawMaterial();
        rm.code = "MAT_RAW";
        rm.name = "Insumo Base";
        rm.stockQuantity = 100;

        QuarkusTransaction.requiringNew().run(() -> {
            p.persist();
            rm.persist();
        });

        ProductRawMaterialDTO dto = new ProductRawMaterialDTO("MAT_RAW", 5);

        given().contentType(ContentType.JSON).body(dto)
                .when().post("/api/products/{id}/materials", p.id)
                .then().statusCode(200);
    }

    @Test
    public void testUpdateMaterialQuantity() {
        PanacheMock.mock(Product.class);

        Product p = new Product();
        p.id = 1L;
        p.materials = new ArrayList<>();

        RawMaterial rm = new RawMaterial();
        rm.code = "RM001";

        ProductRawMaterial association = new ProductRawMaterial();
        association.rawMaterial = rm;
        association.quantityNeeded = 2;
        p.materials.add(association);

        Mockito.when(Product.findById(1L)).thenReturn(p);

        ProductRawMaterialDTO dto = new ProductRawMaterialDTO("RM001", 10);

        given().contentType(ContentType.JSON).body(dto)
                .when().put("/api/products/{id}/materials/{materialCode}", 1L, "RM001")
                .then().statusCode(200).body("quantityNeeded", is(10));
    }

    @Test
    public void testDeleteMaterialQuantity() {
        PanacheMock.mock(Product.class);

        Product p = new Product();
        p.id = 1L;
        p.materials = new ArrayList<>();

        RawMaterial rm = new RawMaterial();
        rm.code = "RM001";

        ProductRawMaterial association = new ProductRawMaterial();
        association.rawMaterial = rm;
        p.materials.add(association);

        Mockito.when(Product.findById(1L)).thenReturn(p);

        given().when().delete("/api/products/{id}/materials/{materialCode}", 1L, "RM001")
                .then().statusCode(204);
    }

    @Test
    public void testSyncMaterials_BulkUpdate() {
        PanacheMock.mock(Product.class);
        PanacheMock.mock(RawMaterial.class);

        Product p = new Product();
        p.id = 1L;
        p.materials = new ArrayList<>();
        Mockito.when(Product.findById(1L)).thenReturn(p);

        RawMaterial rm = new RawMaterial();
        rm.code = "RM002";
        PanacheQuery queryMock = Mockito.mock(PanacheQuery.class);
        Mockito.when(queryMock.firstResult()).thenReturn(rm);
        Mockito.when(RawMaterial.find("code", "RM002")).thenReturn(queryMock);

        ProductRawMaterialDTO dto = new ProductRawMaterialDTO("RM002", 15);

        given().contentType(ContentType.JSON).body(Collections.singletonList(dto))
                .when().put("/api/products/{id}/materials", 1L)
                .then().statusCode(200).body("size()", is(1));
    }
}