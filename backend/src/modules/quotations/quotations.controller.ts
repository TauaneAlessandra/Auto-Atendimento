import { Request, Response } from 'express';
import { QuotationsService } from './quotations.service';
import { validateBody, createOrderSchema } from '../../lib/validation';

export const listQuotations = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    res.json(await QuotationsService.findAll(page, limit));
  } catch (error) {
    console.error('[quotations.listQuotations]', error);
    res.status(500).json({ message: 'Erro ao listar cotações' });
  }
};

export const getQuotationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }
    const quotation = await QuotationsService.findById(id);
    if (!quotation) { res.status(404).json({ message: 'Cotação não encontrada' }); return; }
    res.json(quotation);
  } catch (error) {
    console.error('[quotations.getQuotationById]', error);
    res.status(500).json({ message: 'Erro ao buscar cotação' });
  }
};

export const getQuotationByToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotation = await QuotationsService.findByToken(req.params.token);
    if (!quotation) { res.status(404).json({ message: 'Cotação não encontrada' }); return; }
    res.json(quotation);
  } catch (error) {
    console.error('[quotations.getQuotationByToken]', error);
    res.status(500).json({ message: 'Erro ao buscar cotação' });
  }
};

export const createQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = validateBody(createOrderSchema, req.body);
    const quotation = await QuotationsService.create(data);
    res.status(201).json(quotation);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'INVALID_PRODUCTS') {
        res.status(400).json({ message: 'Um ou mais produtos selecionados são inválidos ou estão inativos' });
        return;
      }
      const err = error as Error & { statusCode?: number };
      if (err.statusCode === 400) {
        res.status(400).json({ message: err.message });
        return;
      }
    }
    console.error('[quotations.createQuotation]', error);
    res.status(500).json({ message: 'Erro ao criar cotação' });
  }
};

export const approveQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await QuotationsService.approve(req.params.token);
    res.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') { res.status(404).json({ message: 'Cotação não encontrada' }); return; }
      if (error.message === 'EXPIRED') { res.status(400).json({ message: 'Proposta expirada' }); return; }
      if (error.message.startsWith('ALREADY_')) { res.status(400).json({ message: `Cotação já está ${error.message.replace('ALREADY_', '').toLowerCase()}` }); return; }
    }
    console.error('[quotations.approveQuotation]', error);
    res.status(500).json({ message: 'Erro ao aprovar cotação' });
  }
};

export const rejectQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await QuotationsService.reject(req.params.token);
    res.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') { res.status(404).json({ message: 'Cotação não encontrada' }); return; }
      if (error.message === 'EXPIRED') { res.status(400).json({ message: 'Proposta expirada' }); return; }
      if (error.message.startsWith('ALREADY_')) { res.status(400).json({ message: `Cotação já está ${error.message.replace('ALREADY_', '').toLowerCase()}` }); return; }
    }
    console.error('[quotations.rejectQuotation]', error);
    res.status(500).json({ message: 'Erro ao rejeitar cotação' });
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }
    const { deliveryStatus } = req.body as { deliveryStatus: string };
    if (!QuotationsService.isValidDeliveryStatus(deliveryStatus)) {
      res.status(400).json({ message: 'Status inválido' });
      return;
    }
    const updated = await QuotationsService.updateDeliveryStatus(id, deliveryStatus);
    res.json(updated);
  } catch (error) {
    console.error('[quotations.updateDeliveryStatus]', error);
    res.status(500).json({ message: 'Erro ao atualizar status' });
  }
};
