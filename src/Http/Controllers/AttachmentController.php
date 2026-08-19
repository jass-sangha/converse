<?php

namespace Riwaaq\Chat\Http\Controllers;

use Riwaaq\Chat\Contracts\AttachmentServiceInterface;
use Riwaaq\Chat\Http\Requests\StoreAttachmentRequest;
use Riwaaq\Chat\Http\Resources\AttachmentResource;

class AttachmentController extends Controller
{
    public function __construct(
        protected AttachmentServiceInterface $attachments,
    ) {}

    public function store(StoreAttachmentRequest $request)
    {
        $attachment = $this->attachments->upload(
            $request->file('file'),
            $request->user(),
        );

        return (new AttachmentResource($attachment))->response()->setStatusCode(201);
    }
}
