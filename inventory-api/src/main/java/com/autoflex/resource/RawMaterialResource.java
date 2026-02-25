package com.autoflex.resource;

import java.util.List;

import com.autoflex.dto.RawMaterialDTO;
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

@Path("/api/raw-materials")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RawMaterialResource {

    @GET
    public List<RawMaterial> listAll() {
        return RawMaterial.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        RawMaterial entity = RawMaterial.findById(id);

        if (entity == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(entity).build();
    }

    @GET
    @Path("/code/{code}")
    public Response getByCode(@PathParam("code") String code) {
        RawMaterial entity = RawMaterial.find("code", code).firstResult();

        if (entity == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(entity).build();
    }

    @GET
    @Path("/name/{name}")
    public Response getByName(@PathParam("name") String name) {
        RawMaterial entity = RawMaterial.find("name", name).firstResult();

        if (entity == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(entity).build();
    }

    @GET
    @Path("/search")
    public Response search(@QueryParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return Response.ok(RawMaterial.listAll()).build();
        }

        String searchTerm = "%" + query.trim().toLowerCase() + "%";

        List<RawMaterial> results = RawMaterial.list("lower(code) like ?1 or lower(name) like ?1", searchTerm);

        return Response.ok(results).build();
    }

    @POST
    @Transactional
    public Response create(RawMaterialDTO dto) {
        RawMaterial entity = new RawMaterial();
        entity.code = dto.code();
        entity.name = dto.name();
        entity.stockQuantity = dto.stockQuantity();

        entity.persist();

        return Response.status(Response.Status.CREATED).entity(entity).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, RawMaterialDTO dto) {
        RawMaterial entity = RawMaterial.findById(id);

        if (entity == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        entity.code = dto.code();
        entity.name = dto.name();
        entity.stockQuantity = dto.stockQuantity();

        return Response.ok(entity).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        RawMaterial entity = RawMaterial.findById(id);

        if (entity == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        entity.delete();

        return Response.noContent().build();
    }
}
