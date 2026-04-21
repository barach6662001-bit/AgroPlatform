namespace AgroPlatform.Application.AgroOperations.DTOs;

public class AgroOperationDetailDto : AgroOperationDto
{
    public List<AgroOperationResourceDto> Resources { get; set; } = new();
    public List<AgroOperationMachineryDto> MachineryUsed { get; set; } = new();
}
