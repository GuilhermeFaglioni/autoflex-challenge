package com.autoflex.resource;

import java.util.List;

import com.autoflex.dto.ProductDTO;
import com.autoflex.dto.ProductRawMaterialDTO;
import com.autoflex.model.Product;
import com.autoflex.model.ProductRawMaterial;
import com.autoflex.model.RawMaterial;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductResource {
    @GET
    public List<Product> getAllProducts() {
        return Product.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getProductById(@PathParam("id") Long id) {
        Product entity = Product.findById(id);
        if (entity == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(entity).build();
    }

    @GET
    @Path("/code/{code}")
    public Response getProductByCode(@PathParam("code") String code) {
        Product entity = Product.find("code", code).firstResult();

        if (entity == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(entity).build();
    }

    @GET
    @Path("/name/{name}")
    public Response getProductByName(@PathParam("name") String name) {
        Product entity = Product.find("name", name).firstResult();

        if (entity == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(entity).build();
    }

    @GET
    @Path("/search")
    public Response search(@QueryParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return Response.ok(Product.listAll()).build();
        }

        String searchTerm = "%" + query.trim().toLowerCase() + "%";

        List<Product> results = Product.list("lower(code) like ?1 or lower(name) like ?1", searchTerm);

        return Response.ok(results).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteProduct(@PathParam("id") Long id) {
        Product entity = Product.findById(id);
        if (entity == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        entity.delete();
        return Response.ok().build();
    }

    @POST
    @Transactional
    public Response createProduct(ProductDTO dto) {
        Product entity = new Product();
        entity.name = dto.name();
        entity.code = dto.code();
        entity.price = dto.price();

        entity.persist();

        if (entity.id == null) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }

        return Response.ok(entity).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response updateProduct(@PathParam("id") Long id, ProductDTO dto) {
        Product entity = Product.findById(id);
        if (entity == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        entity.name = dto.name();
        entity.code = dto.code();
        entity.price = dto.price();

        entity.persist();

        return Response.ok(entity).build();
    }

    // Association
    @POST
    @Path("/{id}/materials")
    @Transactional
    public Response addRawMaterial(@PathParam("id") Long id, ProductRawMaterialDTO dto) {
        Product entity = Product.findById(id);
        if (entity == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        RawMaterial rawMaterial = RawMaterial.find("code", dto.rawMaterialCode()).firstResult();
        if (rawMaterial == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        ProductRawMaterial productRawMaterial = new ProductRawMaterial();
        productRawMaterial.product = entity;
        productRawMaterial.rawMaterial = rawMaterial;
        productRawMaterial.quantityNeeded = dto.quantityNeeded();

        productRawMaterial.persist();

        return Response.ok(productRawMaterial).build();
    }

    @PUT
    @Path("/{id}/materials/{materialCode}")
    @Transactional
    public Response updateMaterialQuantity(@PathParam("id") Long productId,
            @PathParam("materialCode") String materialCode, ProductRawMaterialDTO dto) {
        Product product = Product.findById(productId);
        if (product == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        ProductRawMaterial associationToUpdate = product.materials.stream()
                .filter(pm -> pm.rawMaterial.code.equals(materialCode))
                .findFirst()
                .orElse(null);

        if (associationToUpdate == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        associationToUpdate.quantityNeeded = dto.quantityNeeded();

        return Response.ok(associationToUpdate).build();
    }

    @DELETE
    @Path("/{id}/materials/{materialCode}")
    @Transactional
    public Response deleteMaterialQuantity(@PathParam("id") Long productId,
            @PathParam("materialCode") String materialCode) {
        Product product = Product.findById(productId);
        if (product == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        ProductRawMaterial associationToDelete = product.materials.stream()
                .filter(pm -> pm.rawMaterial.code.equals(materialCode))
                .findFirst()
                .orElse(null);

        if (associationToDelete == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        product.materials.remove(associationToDelete);

        return Response.noContent().build();

    }

    // Bulk Update
    @PUT
    @Path("/{id}/materials")
    @Transactional
    public Response syncMaterials(@PathParam("id") Long id, List<ProductRawMaterialDTO> materialDTOs) {
        Product product = Product.findById(id);
        if (product == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        product.materials.clear();

        for (ProductRawMaterialDTO dto : materialDTOs) {
            RawMaterial rawMaterial = RawMaterial.find("code", dto.rawMaterialCode()).firstResult();
            if (rawMaterial == null) {
                return Response.status(Response.Status.BAD_REQUEST).build();
            }

            ProductRawMaterial newAssociation = new ProductRawMaterial();
            newAssociation.rawMaterial = rawMaterial;
            newAssociation.quantityNeeded = dto.quantityNeeded();

            product.addRawMaterial(newAssociation);
        }

        return Response.ok(product.materials).build();
    }
}
