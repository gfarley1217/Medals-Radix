import Medal from "./Medal";
import { Box, Table, Flex, Badge, Button, Tooltip } from "@radix-ui/themes";
import { TrashIcon, CheckIcon, ResetIcon } from "@radix-ui/react-icons";

function Country(props) {
  function getMedalsTotal() {
    let sum = 0;
    props.medals.forEach((medal) => {
      sum += props.country[medal.name]?.page_value ?? 0;
    });
    return sum;
  }

  function hasUnsavedChanges() {
    let unsaved = false;
    props.medals.forEach((medal) => {
      const pageVal = props.country[medal.name]?.page_value ?? 0;
      const savedVal = props.country[medal.name]?.saved_value ?? 0;
      if (pageVal !== savedVal) {
        unsaved = true;
      }
    });
    return unsaved;
  }

  return (
    <Box width="300px">
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell colSpan="2">
              <Flex justify="between">
                <span>
                  {props.country.name}
                  <Badge variant="outline" ml="2">
                    {getMedalsTotal()}
                  </Badge>
                </span>

                <div
                  style={{
                    display: "flex",
                    gap: "1.2rem",
                    justifyContent: "space-between",
                  }}
                >
                  {props.canPatch && hasUnsavedChanges() && (
                    <>
                      <Tooltip content="Reset changes">
                        <Button
                          color="gray"
                          variant="ghost"
                          size="1"
                          onClick={() => props.onReset(props.country.id)}
                        >
                          <ResetIcon />
                        </Button>
                      </Tooltip>

                      <Tooltip content="Save changes">
                        <Button
                          color="gray"
                          variant="ghost"
                          size="1"
                          onClick={() => props.onSave(props.country.id)}
                        >
                          <CheckIcon />
                        </Button>
                      </Tooltip>
                    </>
                  )}

                  {props.canDelete && (
                    <Tooltip content="Delete country">
                      <Button
                        color="red"
                        variant="ghost"
                        size="1"
                        onClick={() => props.onDelete(props.country.id)}
                      >
                        <TrashIcon />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </Flex>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {props.medals
            .slice()
            .sort((a, b) => (a.rank ?? a.id) - (b.rank ?? b.id))
            .map((medal) => (
              <Medal
                key={medal.id}
                medal={medal}
                country={props.country}
                canPatch={props.canPatch}
                onIncrement={props.onIncrement}
                onDecrement={props.onDecrement}
              />
            ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

export default Country;
