import { describe, it, expect } from 'vitest'
import { buildScenarioGraph, SCENARIO_DEFINITIONS } from '../../src/simulation/scenarios'
import { CONNECTOR_LIBRARY } from '../../src/config'

describe('Scenario Graph Builder', () => {
  const connectorIds = new Set(CONNECTOR_LIBRARY.map(c => c.id));

  Object.values(SCENARIO_DEFINITIONS).forEach(scenario => {
    describe(`Scenario: ${scenario.name}`, () => {
      
      it('should build a graph with the correct number of nodes', () => {
        const nodes = buildScenarioGraph(scenario.id);
        expect(nodes.length).toBe(scenario.nodes.length);
      });

      it('should only use connectors from the master library', () => {
        const nodes = buildScenarioGraph(scenario.id);
        nodes.forEach(node => {
          expect(connectorIds.has(node.id)).toBe(true);
        });
      });

      it('should have all connections point to valid nodes within the scenario', () => {
        const nodes = buildScenarioGraph(scenario.id);
        const nodeIdsInScenario = new Set(nodes.map(n => n.id));
        
        nodes.forEach(node => {
          node.neighbors.forEach(neighborId => {
            expect(nodeIdsInScenario.has(neighborId)).toBe(true);
          });
        });
      });

      it('should correctly map node properties from the connector library', () => {
        const nodes = buildScenarioGraph(scenario.id);
        nodes.forEach(node => {
          const template = CONNECTOR_LIBRARY.find(t => t.id === node.id);
          expect(node.name).toBe(template?.name);
          expect(node.icon).toBe(template?.icon);
          expect(node.risk).toBe(template?.risk);
        });
      });
    });
  });
});
